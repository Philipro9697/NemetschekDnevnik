using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NemetschekDnevnik.Server.Migrations
{
    /// <inheritdoc />
    public partial class dbseedertest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "grade_types",
                columns: table => new
                {
                    grade_type_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__grade_ty__31F4E60D09520132", x => x.grade_type_id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                columns: table => new
                {
                    subject_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    subject_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__subjects__5004F6600397BCF4", x => x.subject_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    is_approved = table.Column<bool>(type: "bit", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users__B9BE370F8F2732C5", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "admin",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__admin__43AA41416A23D12D", x => x.admin_id);
                    table.ForeignKey(
                        name: "FK__admin__admin_id__4AB81AF0",
                        column: x => x.admin_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "parent",
                columns: table => new
                {
                    parent_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__parent__F2A60819165AFAB8", x => x.parent_id);
                    table.ForeignKey(
                        name: "FK__parent__parent_i__412EB0B6",
                        column: x => x.parent_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    token = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    is_revoked = table.Column<bool>(type: "bit", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teacher",
                columns: table => new
                {
                    teacher_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__teacher__03AE777ECC09F8E1", x => x.teacher_id);
                    table.ForeignKey(
                        name: "FK__teacher__teacher__47DBAE45",
                        column: x => x.teacher_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "classes",
                columns: table => new
                {
                    class_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    class_grade = table.Column<int>(type: "int", nullable: false),
                    class_letter = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    head_teacher_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__classes__FDF4798618B5F560", x => x.class_id);
                    table.ForeignKey(
                        name: "FK__classes__head_te__52593CB8",
                        column: x => x.head_teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "teacher_subjects",
                columns: table => new
                {
                    teacher_id = table.Column<int>(type: "int", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__teacher___16AE3818951F373C", x => new { x.teacher_id, x.subject_id });
                    table.ForeignKey(
                        name: "FK__teacher_s__subje__4E88ABD4",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__teacher_s__teach__4D94879B",
                        column: x => x.teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "homework_items",
                columns: table => new
                {
                    homework_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false, defaultValue: "Домашно задание"),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    date_assigned = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    date_due = table.Column<DateTime>(type: "datetime", nullable: false),
                    resource_link = table.Column<string>(type: "varchar(550)", unicode: false, maxLength: 550, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__homework__FD60442ADE5A56DA", x => x.homework_id);
                    table.ForeignKey(
                        name: "FK__homework___class__76969D2E",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK__homework___subje__778AC167",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__homework___teach__787EE5A0",
                        column: x => x.teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "student",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false),
                    parent_id = table.Column<int>(type: "int", nullable: true),
                    class_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__student__2A33069A22388D38", x => x.student_id);
                    table.ForeignKey(
                        name: "FK__student__parent___44FF419A",
                        column: x => x.parent_id,
                        principalTable: "parent",
                        principalColumn: "parent_id");
                    table.ForeignKey(
                        name: "FK__student__student__440B1D61",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_student_class_id",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                });

            migrationBuilder.CreateTable(
                name: "weekly_schedule_items",
                columns: table => new
                {
                    schedule_item_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    day_of_week = table.Column<int>(type: "int", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    time = table.Column<TimeOnly>(type: "time", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__weekly_s__23BB45AD8B634EEF", x => x.schedule_item_id);
                    table.ForeignKey(
                        name: "FK__weekly_sc__class__5BE2A6F2",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK__weekly_sc__subje__59FA5E80",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__weekly_sc__teach__5AEE82B9",
                        column: x => x.teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "grades",
                columns: table => new
                {
                    grade_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    grade_value = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    student_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    grade_type_id = table.Column<int>(type: "int", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    entry_date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__grades__3A8F732CFED7D652", x => x.grade_id);
                    table.ForeignKey(
                        name: "FK__grades__grade_ty__6E01572D",
                        column: x => x.grade_type_id,
                        principalTable: "grade_types",
                        principalColumn: "grade_type_id");
                    table.ForeignKey(
                        name: "FK__grades__student___6C190EBB",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
                    table.ForeignKey(
                        name: "FK__grades__subject___6B24EA82",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__grades__teacher___6D0D32F4",
                        column: x => x.teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "remarks",
                columns: table => new
                {
                    remark_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    date_created = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__remarks__D46DA2D906BAA593", x => x.remark_id);
                    table.ForeignKey(
                        name: "FK__remarks__student__70DDC3D8",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__remarks__teacher__71D1E811",
                        column: x => x.teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "submitted_homeworks",
                columns: table => new
                {
                    submission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    homework_id = table.Column<int>(type: "int", nullable: true),
                    student_id = table.Column<int>(type: "int", nullable: true),
                    submission_text = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    file_link = table.Column<string>(type: "varchar(550)", unicode: false, maxLength: 550, nullable: true),
                    submitted_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    teacher_feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_graded = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__submitte__9B5355957BC8AEF5", x => x.submission_id);
                    table.ForeignKey(
                        name: "FK__submitted__homew__7D439ABD",
                        column: x => x.homework_id,
                        principalTable: "homework_items",
                        principalColumn: "homework_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__submitted__stude__7E37BEF6",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "lessons",
                columns: table => new
                {
                    lesson_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    time = table.Column<TimeOnly>(type: "time", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    schedule_item_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__lessons__6421F7BEFFB3A617", x => x.lesson_id);
                    table.ForeignKey(
                        name: "FK__lessons__class_i__60A75C0F",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK__lessons__schedul__619B8048",
                        column: x => x.schedule_item_id,
                        principalTable: "weekly_schedule_items",
                        principalColumn: "schedule_item_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK__lessons__subject__5EBF139D",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__lessons__teacher__5FB337D6",
                        column: x => x.teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "attendance",
                columns: table => new
                {
                    lesson_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    is_absent = table.Column<bool>(type: "bit", nullable: false),
                    is_excused = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__attendan__D682C7D7E114F3DE", x => new { x.lesson_id, x.student_id });
                    table.ForeignKey(
                        name: "FK__attendanc__lesso__6477ECF3",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "lesson_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__attendanc__stude__656C112C",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_attendance_student_id",
                table: "attendance",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_classes_head_teacher_id",
                table: "classes",
                column: "head_teacher_id");

            migrationBuilder.CreateIndex(
                name: "IX_grades_grade_type_id",
                table: "grades",
                column: "grade_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_grades_student_id",
                table: "grades",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_grades_subject_id",
                table: "grades",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_grades_teacher_id",
                table: "grades",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "IX_homework_items_class_id",
                table: "homework_items",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_homework_items_subject_id",
                table: "homework_items",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_homework_items_teacher_id",
                table: "homework_items",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_class_id",
                table: "lessons",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_schedule_item_id",
                table: "lessons",
                column: "schedule_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_subject_id",
                table: "lessons",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_teacher_id",
                table: "lessons",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_remarks_student_id",
                table: "remarks",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_remarks_teacher_id",
                table: "remarks",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_class_id",
                table: "student",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_parent_id",
                table: "student",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_submitted_homeworks_homework_id",
                table: "submitted_homeworks",
                column: "homework_id");

            migrationBuilder.CreateIndex(
                name: "IX_submitted_homeworks_student_id",
                table: "submitted_homeworks",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_teacher_subjects_subject_id",
                table: "teacher_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "UQ__users__AB6E61649DF4B344",
                table: "users",
                column: "email",
                unique: true,
                filter: "[is_deleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_weekly_schedule_items_class_id",
                table: "weekly_schedule_items",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_weekly_schedule_items_subject_id",
                table: "weekly_schedule_items",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_weekly_schedule_items_teacher_id",
                table: "weekly_schedule_items",
                column: "teacher_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin");

            migrationBuilder.DropTable(
                name: "attendance");

            migrationBuilder.DropTable(
                name: "grades");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "remarks");

            migrationBuilder.DropTable(
                name: "submitted_homeworks");

            migrationBuilder.DropTable(
                name: "teacher_subjects");

            migrationBuilder.DropTable(
                name: "lessons");

            migrationBuilder.DropTable(
                name: "grade_types");

            migrationBuilder.DropTable(
                name: "homework_items");

            migrationBuilder.DropTable(
                name: "student");

            migrationBuilder.DropTable(
                name: "weekly_schedule_items");

            migrationBuilder.DropTable(
                name: "parent");

            migrationBuilder.DropTable(
                name: "classes");

            migrationBuilder.DropTable(
                name: "subjects");

            migrationBuilder.DropTable(
                name: "teacher");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
