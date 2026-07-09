CREATE DATABASE NemetschekSchoolDiary
GO
USE NemetschekSchoolDiary
GO

CREATE TABLE [users] (
    [user_id] INT IDENTITY(1,1) PRIMARY KEY,
    [user_name] VARCHAR(255) NOT NULL UNIQUE,
    [email] VARCHAR(255) NOT NULL UNIQUE,
    [normalized_user_name] VARCHAR(255) NOT NULL,
    [normalized_email] VARCHAR(255) NOT NULL,
    [password_hash] VARCHAR(255) NOT NULL,
    [security_stamp] VARCHAR(255) NULL,
    [concurrency_stamp] VARCHAR(255) NULL,
    [phone_number] VARCHAR(50) NULL,
    [phone_number_confirmed] BIT NOT NULL DEFAULT 0,
    [two_factor_enabled] BIT NOT NULL DEFAULT 0,
    [lockout_end] DATETIMEOFFSET NULL,
    [lockout_enabled] BIT NOT NULL DEFAULT 0,
    [access_failed_count] INT NOT NULL DEFAULT 0,
    [role] VARCHAR(50) NOT NULL CHECK ([role] IN ('student', 'parent', 'teacher', 'admin')),
    [is_approved] BIT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IX_users_normalized_user_name ON [users] ([normalized_user_name]);
CREATE UNIQUE INDEX IX_users_normalized_email ON [users] ([normalized_email]);

CREATE TABLE [subjects] (
    [subject_id] INT IDENTITY(1,1) PRIMARY KEY,
    [subject_name] NVARCHAR(100) NOT NULL
);

CREATE TABLE [student] (
    [student_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE,
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL,
    [phone_number] VARCHAR(10) NOT NULL
);

CREATE TABLE [parent] (
    [parent_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE,
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL,
    [phone_number] VARCHAR(10) NOT NULL
);

CREATE TABLE [parent_student] (
    [parent_id] INT FOREIGN KEY REFERENCES [parent]([parent_id]),
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    PRIMARY KEY ([parent_id], [student_id])
);

CREATE TABLE [teacher] (
    [teacher_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE,
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL,
    [phone_number] VARCHAR(10) NOT NULL
);

CREATE TABLE [teacher_subjects] (
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    PRIMARY KEY ([teacher_id], [subject_id])
);

CREATE TABLE [admin] (
    [admin_id] INT PRIMARY KEY REFERENCES [users]([user_id]) ON DELETE CASCADE,
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL
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

CREATE TABLE [weekly_schedules] (
    [schedule_id] INT IDENTITY(1,1) PRIMARY KEY,
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [class_id] INT FOREIGN KEY REFERENCES [classes]([class_id]),
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [date] DATE NOT NULL,
    [time] TIME NOT NULL,
    [location] NVARCHAR(100) NULL
);

CREATE TABLE [attendance] (
    [lesson_id] INT FOREIGN KEY REFERENCES [weekly_schedules]([schedule_id]),
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    [status] NVARCHAR(50) NOT NULL CHECK ([status] IN ('��������', '���������', '��������')),
    PRIMARY KEY ([lesson_id], [student_id])
);

CREATE TABLE [grades] (
    [grade_id] INT IDENTITY(1,1) PRIMARY KEY,
    [grade_value] VARCHAR(10) NOT NULL,
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [student_id] INT FOREIGN KEY REFERENCES [student]([student_id]),
    [teacher_id] INT FOREIGN KEY REFERENCES [teacher]([teacher_id]),
    [entry_date] DATE NOT NULL
);

CREATE TABLE [homework_items] (
    [homework_id] INT IDENTITY(1,1) PRIMARY KEY,
    [class_id] INT FOREIGN KEY REFERENCES [classes]([class_id]),
    [subject_id] INT FOREIGN KEY REFERENCES [subjects]([subject_id]),
    [date_due] DATE NOT NULL,
    [subject_link] VARCHAR(255) NULL
);
