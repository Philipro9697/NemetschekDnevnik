using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace NemetschekDnevnik.Server.Models;

public partial class DnevnikContext : DbContext
{
    public DnevnikContext()
    {
    }

    public DnevnikContext(DbContextOptions<DnevnikContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<Grade> Grades { get; set; }

    public virtual DbSet<GradeType> GradeTypes { get; set; }

    public virtual DbSet<HomeworkItem> HomeworkItems { get; set; }

    public virtual DbSet<Lesson> Lessons { get; set; }

    public virtual DbSet<Parent> Parents { get; set; }

    public virtual DbSet<Remark> Remarks { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<SubmittedHomework> SubmittedHomeworks { get; set; }

    public virtual DbSet<Teacher> Teachers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<WeeklyScheduleItem> WeeklyScheduleItems { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("PK__admin__43AA41416A23D12D");

            entity.ToTable("admin");

            entity.Property(e => e.AdminId)
                .ValueGeneratedNever()
                .HasColumnName("admin_id");

            entity.HasOne(d => d.AdminNavigation).WithOne(p => p.Admin)
                .HasForeignKey<Admin>(d => d.AdminId)
                .HasConstraintName("FK__admin__admin_id__4AB81AF0");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => new { e.LessonId, e.StudentId }).HasName("PK__attendan__D682C7D7E114F3DE");

            entity.ToTable("attendance");

            entity.Property(e => e.LessonId).HasColumnName("lesson_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.IsAbsent).HasColumnName("is_absent");
            entity.Property(e => e.IsExcused).HasColumnName("is_excused");

            entity.HasOne(d => d.Lesson).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK__attendanc__lesso__6477ECF3");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__attendanc__stude__656C112C");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__classes__FDF4798618B5F560");

            entity.ToTable("classes");

            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.ClassGrade).HasColumnName("class_grade");
            entity.Property(e => e.ClassLetter)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("class_letter");
            entity.Property(e => e.HeadTeacherId).HasColumnName("head_teacher_id");

            entity.HasOne(d => d.HeadTeacher).WithMany(p => p.Classes)
                .HasForeignKey(d => d.HeadTeacherId)
                .HasConstraintName("FK__classes__head_te__52593CB8");
        });

        modelBuilder.Entity<Grade>(entity =>
        {
            entity.HasKey(e => e.GradeId).HasName("PK__grades__3A8F732CFED7D652");

            entity.ToTable("grades");

            entity.Property(e => e.GradeId).HasColumnName("grade_id");
            entity.Property(e => e.Comment)
                .HasMaxLength(255)
                .HasColumnName("comment");
            entity.Property(e => e.EntryDate).HasColumnName("entry_date");
            entity.Property(e => e.GradeTypeId).HasColumnName("grade_type_id");
            entity.Property(e => e.GradeValue)
                .HasColumnType("decimal(3, 2)")
                .HasColumnName("grade_value");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");

            entity.HasOne(d => d.GradeType).WithMany(p => p.Grades)
                .HasForeignKey(d => d.GradeTypeId)
                .HasConstraintName("FK__grades__grade_ty__6E01572D");

            entity.HasOne(d => d.Student).WithMany(p => p.Grades)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__grades__student___6C190EBB");

            entity.HasOne(d => d.Subject).WithMany(p => p.Grades)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK__grades__subject___6B24EA82");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Grades)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__grades__teacher___6D0D32F4");
        });

        modelBuilder.Entity<GradeType>(entity =>
        {
            entity.HasKey(e => e.GradeTypeId).HasName("PK__grade_ty__31F4E60D09520132");

            entity.ToTable("grade_types");

            entity.Property(e => e.GradeTypeId).HasColumnName("grade_type_id");
            entity.Property(e => e.TypeName)
                .HasMaxLength(50)
                .HasColumnName("type_name");
        });

        modelBuilder.Entity<HomeworkItem>(entity =>
        {
            entity.HasKey(e => e.HomeworkId).HasName("PK__homework__FD60442ADE5A56DA");

            entity.ToTable("homework_items");

            entity.Property(e => e.HomeworkId).HasColumnName("homework_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.DateAssigned)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("date_assigned");
            entity.Property(e => e.DateDue)
                .HasColumnType("datetime")
                .HasColumnName("date_due");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ResourceLink)
                .HasMaxLength(550)
                .IsUnicode(false)
                .HasColumnName("resource_link");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.Title)
                .HasMaxLength(150)
                .HasDefaultValue("Домашно задание")
                .HasColumnName("title");

            entity.HasOne(d => d.Class).WithMany(p => p.HomeworkItems)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__homework___class__76969D2E");

            entity.HasOne(d => d.Subject).WithMany(p => p.HomeworkItems)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK__homework___subje__778AC167");

            entity.HasOne(d => d.Teacher).WithMany(p => p.HomeworkItems)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__homework___teach__787EE5A0");
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.LessonId).HasName("PK__lessons__6421F7BEFFB3A617");

            entity.ToTable("lessons");

            entity.Property(e => e.LessonId).HasColumnName("lesson_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.ScheduleItemId).HasColumnName("schedule_item_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.Time).HasColumnName("time");

            entity.HasOne(d => d.Class).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__lessons__class_i__60A75C0F");

            entity.HasOne(d => d.ScheduleItem).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.ScheduleItemId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__lessons__schedul__619B8048");

            entity.HasOne(d => d.Subject).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK__lessons__subject__5EBF139D");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__lessons__teacher__5FB337D6");
        });

        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.ParentId).HasName("PK__parent__F2A60819165AFAB8");

            entity.ToTable("parent");

            entity.Property(e => e.ParentId)
                .ValueGeneratedNever()
                .HasColumnName("parent_id");

            entity.HasOne(d => d.ParentNavigation).WithOne(p => p.Parent)
                .HasForeignKey<Parent>(d => d.ParentId)
                .HasConstraintName("FK__parent__parent_i__412EB0B6");
        });

        modelBuilder.Entity<Remark>(entity =>
        {
            entity.HasKey(e => e.RemarkId).HasName("PK__remarks__D46DA2D906BAA593");

            entity.ToTable("remarks");

            entity.Property(e => e.RemarkId).HasColumnName("remark_id");
            entity.Property(e => e.DateCreated)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("date_created");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.Text).HasColumnName("text");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");

            entity.HasOne(d => d.Student).WithMany(p => p.Remarks)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__remarks__student__70DDC3D8");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Remarks)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__remarks__teacher__71D1E811");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__student__2A33069A22388D38");

            entity.ToTable("student");

            entity.Property(e => e.StudentId)
                .ValueGeneratedNever()
                .HasColumnName("student_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.ParentId).HasColumnName("parent_id");

            entity.HasOne(d => d.Class).WithMany(p => p.Students)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK_student_class_id");

            entity.HasOne(d => d.Parent).WithMany(p => p.Students)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK__student__parent___44FF419A");

            entity.HasOne(d => d.StudentNavigation).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.StudentId)
                .HasConstraintName("FK__student__student__440B1D61");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.SubjectId).HasName("PK__subjects__5004F6600397BCF4");

            entity.ToTable("subjects");

            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.SubjectName)
                .HasMaxLength(100)
                .HasColumnName("subject_name");
        });

        modelBuilder.Entity<SubmittedHomework>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("PK__submitte__9B5355957BC8AEF5");

            entity.ToTable("submitted_homeworks");

            entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
            entity.Property(e => e.FileLink)
                .HasMaxLength(550)
                .IsUnicode(false)
                .HasColumnName("file_link");
            entity.Property(e => e.HomeworkId).HasColumnName("homework_id");
            entity.Property(e => e.IsGraded).HasColumnName("is_graded");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.SubmissionText).HasColumnName("submission_text");
            entity.Property(e => e.SubmittedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("submitted_at");
            entity.Property(e => e.TeacherFeedback).HasColumnName("teacher_feedback");

            entity.HasOne(d => d.Homework).WithMany(p => p.SubmittedHomeworks)
                .HasForeignKey(d => d.HomeworkId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__submitted__homew__7D439ABD");

            entity.HasOne(d => d.Student).WithMany(p => p.SubmittedHomeworks)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__submitted__stude__7E37BEF6");
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.TeacherId).HasName("PK__teacher__03AE777ECC09F8E1");

            entity.ToTable("teacher");

            entity.Property(e => e.TeacherId)
                .ValueGeneratedNever()
                .HasColumnName("teacher_id");

            entity.HasOne(d => d.TeacherNavigation).WithOne(p => p.Teacher)
                .HasForeignKey<Teacher>(d => d.TeacherId)
                .HasConstraintName("FK__teacher__teacher__47DBAE45");

            entity.HasMany(d => d.Subjects).WithMany(p => p.Teachers)
                .UsingEntity<Dictionary<string, object>>(
                    "TeacherSubject",
                    r => r.HasOne<Subject>().WithMany()
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__teacher_s__subje__4E88ABD4"),
                    l => l.HasOne<Teacher>().WithMany()
                        .HasForeignKey("TeacherId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__teacher_s__teach__4D94879B"),
                    j =>
                    {
                        j.HasKey("TeacherId", "SubjectId").HasName("PK__teacher___16AE3818951F373C");
                        j.ToTable("teacher_subjects");
                        j.IndexerProperty<int>("TeacherId").HasColumnName("teacher_id");
                        j.IndexerProperty<int>("SubjectId").HasColumnName("subject_id");
                    });
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370F8F2732C5");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E61649DF4B344").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.IsApproved).HasColumnName("is_approved");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password_hash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone_number");
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .HasColumnName("role");
        });

        modelBuilder.Entity<WeeklyScheduleItem>(entity =>
        {
            entity.HasKey(e => e.ScheduleItemId).HasName("PK__weekly_s__23BB45AD8B634EEF");

            entity.ToTable("weekly_schedule_items");

            entity.Property(e => e.ScheduleItemId).HasColumnName("schedule_item_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.DayOfWeek).HasColumnName("day_of_week");
            entity.Property(e => e.Location)
                .HasMaxLength(100)
                .HasColumnName("location");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.Time).HasColumnName("time");

            entity.HasOne(d => d.Class).WithMany(p => p.WeeklyScheduleItems)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__weekly_sc__class__5BE2A6F2");

            entity.HasOne(d => d.Subject).WithMany(p => p.WeeklyScheduleItems)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK__weekly_sc__subje__59FA5E80");

            entity.HasOne(d => d.Teacher).WithMany(p => p.WeeklyScheduleItems)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__weekly_sc__teach__5AEE82B9");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
