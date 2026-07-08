# Архитектура на auth, роли и flow за NemetschekDnevnik

Този документ описва целевия flow за регистрация, логин, JWT, одобрение от администратор/учител и основната защита на ендпойнтове според текущата реализация и задачите от Confluence.


## 2. Flow: Регистрация

```mermaid
sequenceDiagram
    participant U as User / Frontend
    participant A as AuthController
    participant S as AuthService
    participant DB as Database

    U->>A: POST /api/auth/register
    A->>S: RegisterAsync(email, password, role, names, phone)
    S->>DB: Проверка дали email съществува
    alt email е свободен и ролята е валидна
        S->>S: BCrypt.HashPassword(password)
        S->>DB: Insert into users (email, password_hash, role, is_approved=false)
        S->>DB: Insert into role-specific table (admin/teacher/student/parent)
        S-->>A: success = true
        A-->>U: 200 OK "Registered. Awaiting approval."
    else невалидни данни или дублиран email
        S-->>A: false
        A-->>U: 409 Conflict
    end
```

### Какво се случва при регистрация

1. Потребителят изпраща email, password, роля и лични данни.
2. Сървърът проверява дали email не е вече регистриран.
3. Паролата се hash-ва с BCrypt.
4. В `users` се записва потребител с `is_approved = false`.
5. В зависимост от ролята се създава допълнителен запис в `admins`, `teachers`, `students` или `parents`.
6. Потребителят не може да влезе, докато не бъде одобрен.

## 3. Flow: Login

```mermaid
sequenceDiagram
    participant U as User / Frontend
    participant A as AuthController
    participant S as AuthService
    participant T as TokenService
    participant DB as Database

    U->>A: POST /api/auth/login
    A->>S: LoginAsync(email, password)
    S->>DB: Намери user по email
    alt user не съществува
        S-->>A: null
        A-->>U: 401 Unauthorized
    else user съществува
        S->>S: BCrypt.Verify(password, password_hash)
        alt паролата е грешна
            S-->>A: null
            A-->>U: 401 Unauthorized
        else паролата е вярна
            alt user.IsApproved = false
                S-->>A: null
                A-->>U: 401 Unauthorized
            else approved = true
                S->>T: CreateToken(userId, role)
                T-->>S: JWT
                S-->>A: JWT
                A-->>U: 200 OK { token }
            end
        end
    end
```

### Как работи login

1. Сървърът търси потребител по email.
2. Проверява дали въведената парола съвпада с `PasswordHash` чрез BCrypt.
3. Проверява `IsApproved`.
4. Ако всичко е наред, генерира JWT.
5. JWT се връща на клиента и се пази в localStorage/sessionStorage/в memory.

## 4. Flow: JWT и Authorization

```mermaid
sequenceDiagram
    participant C as Client
    participant API as ASP.NET API
    participant JWT as JWT Middleware
    participant M as EnsureApprovedUserMiddleware
    participant DB as Database

    C->>API: Request + Authorization: Bearer <token>
    API->>JWT: Validate token (signature, issuer, audience, expiry)
    JWT-->>API: User authenticated
    API->>M: Check approval status
    M->>DB: Load user by userId from token
    alt user not approved
        M-->>C: 401 Unauthorized
    else approved
        API->>API: Apply role-based authorization
        API-->>C: Requested data / 403 if forbidden
    end
```

### Как работи JWT

- JWT се генерира от `TokenService`.
- Вътре в токена се слагат claims:
  - `NameIdentifier` = `userId`
  - `Role` = `roleName`
- Токенът се подписва със HMAC-SHA256.
- Валидацията е зададена в `Program.cs` чрез `AddJwtBearer`.
- Срокът на валидност е 8 часа.

### Важни бележки

- В момента токенът не съдържа refresh token.
- В момента няма email verification.
- В момента няма login throttling / lockout / password reset flow.

## 5. Flow: Администраторско одобрение

```mermaid
sequenceDiagram
    participant Admin as Admin / Teacher
    participant API as UsersController
    participant S as UserProfileService
    participant DB as Database

    Admin->>API: PUT /api/users/{id}/approve
    API->>S: ApproveAsync(id)
    S->>DB: Find user by id
    S->>DB: Set is_approved = true
    S-->>API: updated profile
    API-->>Admin: 200 OK

    Note over Admin,DB: След това потребителят може да влезе успешно.
```

### Какво прави администратора

- Вижда списък с чакащи регистрации.
- Одобрява или блокира потребител.
- Изтрива невалиден или нежелан профил.
- Има достъп до административни операции, които са защитени с `[Authorize(Roles = "Admin")]`.

## 6. Ролеви права и защита

Текущата логика трябва да се разшири в следните нива:

### Ниво 1: Auth
- `POST /api/auth/login`
- `POST /api/auth/register`

### Ниво 2: Authorization
- `Admin` -> пълен достъп до админ панел и управление на потребители
- `Teacher` -> достъп до дневник, оценки, отсъствия, съобщения
- `Student` -> достъп само до собствените оценки, домашни, отсъствия, профил
- `Parent` -> достъп само до данните на собствените деца

### Ниво 3: Data access rules
- Ученикът не трябва да вижда данните на други ученици.
- Родителят трябва да вижда само децата, които са свързани чрез `ParentStudentRelation`.
- Учителят трябва да вижда само класове/ученици, за които е отговорен.

## 7. Какво трябва да се разшири в Models и Server

### A. User & security

Да се добавят/разширят полета в `User`:

- `IsBlocked`
- `EmailConfirmed`
- `LastLoginAt`
- `FailedLoginAttempts`
- `RefreshToken`
- `RefreshTokenExpiry`
- `PasswordResetToken`
- `PasswordResetExpiry`

### B. Parent-Student relations

В момента има връзка `Student.ParentId`, но според Confluence е по-добре да се въведе отделна таблица:

- `ParentStudentRelation`
  - `ParentId`
  - `StudentId`
  - `RelationType`
  - `IsActive`
  - `CreatedAt`

Това е по-гъвкаво и отговаря на изискването за “Many-to-Many”.

### C. Messages & notifications

Нужно е да се добавят модели:

- `Message`
- `MessageRecipient`
- `Notification`
- `SupportTicket`

### D. Calendar & LMS

- `CalendarEvent`
- `Attachment`
- `LmsMaterial`
- `Feedback`

### E. Audit / operations

- `AuditLog`
- `LoginAttempt`
- `PasswordChangeHistory`

## 8. Flow: Съобщения и известия

```mermaid
sequenceDiagram
    participant T as Teacher
    participant API as MessagesController
    participant S as MessageService
    participant DB as Database
    participant N as NotificationService
    participant P as Parent/Student

    T->>API: POST /api/messages
    API->>S: CreateMessage(...)
    S->>DB: Save message + recipients
    S->>N: Send notification email / push
    N-->>P: Email / in-app notification
    P-->>API: Reply to message
    API->>DB: Save reply as thread
```

### Логика

- Учителят изпраща съобщение до клас или конкретни родителите.
- Сървърът записва съобщението и получателите.
- Генерира се уведомление/имейл.
- Родителят може да отговори и съобщението се записва като thread.

## 9. Recommended target architecture

```mermaid
flowchart LR
    A[Client / React App] --> B[AuthController]
    B --> C[AuthService]
    C --> D[(Users Table)]
    C --> E[TokenService]
    E --> F[JWT]
    B --> G[UsersController]
    G --> H[UserProfileService]
    H --> D
    A --> I[Other Controllers]
    I --> J[Business Services]
    J --> D
    J --> K[NotificationService]
    K --> L[SMTP / Email]
```

## 10. Практически препоръка за реализация

1. Запази текущия flow за регистрация и login.
2. Добави `RefreshToken` и `EmailConfirmed`.
3. Замени/разшири current middleware с политики:
   - `RequireApprovedUser`
   - `RequireRole_Admin`
   - `RequireRole_Teacher`
   - `RequireRole_Student`
   - `RequireRole_Parent`
4. Добави `ParentStudentRelation` вместо проста `Student.ParentId`.
5. Добави `Message`, `Notification`, `AuditLog`, `SupportTicket`.
6. За всички чувствителни операции логвай действията.

## 11. Кратко обобщение

Най-важното е да се следва този модел:

- Регистрация -> създаване на потребител с `IsApproved = false`
- Login -> проверка на парола + одобрение + създаване на JWT
- JWT -> защита на всички API ендпойнти
- Admin -> одобрение и управление
- RBAC + data ownership rules -> ограничаване на достъпа според роля и собственост
- Следващи фази -> съобщения, известия, LMS, календар и отчети
