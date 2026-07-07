CREATE DATABASE Dnevnik;
GO
USE Dnevnik;
GO


CREATE TABLE [users] (
    [user_id] INT IDENTITY(1,1) PRIMARY KEY,
    [email] VARCHAR(255) NOT NULL UNIQUE,
    [password_hash] VARCHAR(255) NOT NULL,
    [role] NVARCHAR(50) NOT NULL CHECK ([role] IN (N'ученик', N'родител', N'учител', N'администратор')),
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL,
    [phone_number] VARCHAR(20) NULL,
    [is_approved] BIT NOT NULL DEFAULT 0,
    [created_at] DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE [subjects] (
    [subject_id] INT IDENTITY(1,1) PRIMARY KEY,
    [subject_name] NVARCHAR(100) NOT NULL
);

CREATE TABLE [grade_types] (
    [grade_type_id] INT IDENTITY(1,1) PRIMARY KEY,
    [type_name] NVARCHAR(50) NOT NULL
);

INSERT INTO [grade_types] ([type_name]) 
VALUES (N'Текуща'), (N'Класно'), (N'Срочна'), (N'Годишна');

CREATE TABLE [parent] (
    [parent_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE
);

CREATE TABLE [student] (
    [student_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE,
    [parent_id] INT FOREIGN KEY REFERENCES [parent]([parent_id])
);

CREATE TABLE [teacher] (
    [teacher_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE
);

CREATE TABLE [admin] (
    [admin_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE
);

CREATE TABLE [teacher_subjects] (
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    PRIMARY KEY ([teacher_id], [subject_id])
);


CREATE TABLE [classes] (
    [class_id] INT IDENTITY(1,1) PRIMARY KEY,
    [class_grade] INT NOT NULL CHECK ([class_grade] BETWEEN 1 AND 12),
    [class_letter] VARCHAR(10) NOT NULL,
    [head_teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id])
);

CREATE TABLE [student_class] (
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    [class_id] INT FOREIGN KEY REFERENCES [classes]([class_id]),
    PRIMARY KEY ([student_id], [class_id])
);

CREATE TABLE [weekly_schedule_items] (
    [schedule_item_id] INT IDENTITY(1,1) PRIMARY KEY,
    [day_of_week] INT NOT NULL CHECK ([day_of_week] BETWEEN 1 AND 7), 
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [time] TIME NOT NULL,
    [class_id] INT FOREIGN KEY REFERENCES [classes]([class_id]),
    [location] NVARCHAR(100) NULL
);

CREATE TABLE [lessons] (
    [lesson_id] INT IDENTITY(1,1) PRIMARY KEY,
    [date] DATE NOT NULL, 
    [time] TIME NOT NULL,
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [class_id] INT FOREIGN KEY REFERENCES [classes]([class_id]),
    [schedule_item_id] INT FOREIGN KEY REFERENCES [weekly_schedule_items]([schedule_item_id]) ON DELETE SET NULL
);

CREATE TABLE [attendance] (
    [lesson_id] INT FOREIGN KEY REFERENCES [lessons]([lesson_id]) ON DELETE CASCADE,
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    [is_absent] BIT NOT NULL DEFAULT 0, -- 1 = Отсъства, 0 = Присъства 
    [is_excused] BIT NOT NULL DEFAULT 0,
    PRIMARY KEY ([lesson_id], [student_id])
);

CREATE TABLE [grades] (
    [grade_id] INT IDENTITY(1,1) PRIMARY KEY,
    [grade_value] DECIMAL(3,2) NOT NULL CONSTRAINT CHK_Grade_Value CHECK ([grade_value] BETWEEN 2.00 AND 6.00),
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [grade_type_id] INT FOREIGN KEY REFERENCES [grade_types]([grade_type_id]),
    [comment] NVARCHAR(255) NULL,
    [entry_date] DATE NOT NULL
);

CREATE TABLE [remarks] (
    [remark_id] INT IDENTITY(1,1) PRIMARY KEY,
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]) ON DELETE CASCADE,
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [type] NVARCHAR(50) NOT NULL CHECK ([type] IN (N'Забележка', N'Похвала')),
    [text] NVARCHAR(MAX) NOT NULL,
    [date_created] DATETIME NOT NULL DEFAULT GETDATE()
);


CREATE TABLE [homework_items] (
    [homework_id] INT IDENTITY(1,1) PRIMARY KEY,
    [class_id] INT FOREIGN KEY REFERENCES [classes]([class_id]),
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [title] NVARCHAR(150) NOT NULL DEFAULT N'Домашно задание', 
    [description] NVARCHAR(MAX) NULL,
    [date_assigned] DATETIME NOT NULL DEFAULT GETDATE(),
    [date_due] DATETIME NOT NULL,
    [resource_link] VARCHAR(550) NULL
);

CREATE TABLE [submitted_homeworks] (
    [submission_id] INT IDENTITY(1,1) PRIMARY KEY,
    [homework_id] INT FOREIGN KEY REFERENCES [homework_items]([homework_id]) ON DELETE CASCADE,
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    [submission_text] NVARCHAR(MAX) NULL,
    [file_link] VARCHAR(550) NULL,
    [submitted_at] DATETIME NOT NULL DEFAULT GETDATE(),
    [teacher_feedback] NVARCHAR(MAX) NULL,
    [is_graded] BIT NOT NULL DEFAULT 0
);
GO