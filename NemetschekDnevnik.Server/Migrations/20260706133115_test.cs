using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NemetschekDnevnik.Server.Migrations
{
    /// <inheritdoc />
    public partial class test : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                columns: table => new
                {
                    subject_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    subject_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__subjects__5004F660E965A954", x => x.subject_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    is_approved = table.Column<bool>(type: "bit", nullable: false),
                    user_name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    normalized_user_name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    normalized_email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    email_confirmed = table.Column<bool>(type: "bit", nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    security_stamp = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    concurrency_stamp = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    phone_number = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phone_number_confirmed = table.Column<bool>(type: "bit", nullable: false),
                    two_factor_enabled = table.Column<bool>(type: "bit", nullable: false),
                    lockout_end = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    lockout_enabled = table.Column<bool>(type: "bit", nullable: false),
                    access_failed_count = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users__B9BE370FB3BC4991", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "admin",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "int", nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__admin__43AA4141760C7B9D", x => x.admin_id);
                    table.ForeignKey(
                        name: "FK__admin__admin_id__59063A47",
                        column: x => x.admin_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "parent",
                columns: table => new
                {
                    parent_id = table.Column<int>(type: "int", nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__parent__F2A6081978DDDBAC", x => x.parent_id);
                    table.ForeignKey(
                        name: "FK__parent__parent_i__4BAC3F29",
                        column: x => x.parent_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__student__2A33069A4369D820", x => x.student_id);
                    table.ForeignKey(
                        name: "FK__student__student__48CFD27E",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teacher",
                columns: table => new
                {
                    teacher_id = table.Column<int>(type: "int", nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__teacher__03AE777EA9BB80AB", x => x.teacher_id);
                    table.ForeignKey(
                        name: "FK__teacher__teacher__52593CB8",
                        column: x => x.teacher_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "parent_student",
                columns: table => new
                {
                    parent_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__parent_s__40053870C72F1416", x => new { x.parent_id, x.student_id });
                    table.ForeignKey(
                        name: "FK__parent_st__paren__4E88ABD4",
                        column: x => x.parent_id,
                        principalTable: "parent",
                        principalColumn: "parent_id");
                    table.ForeignKey(
                        name: "FK__parent_st__stude__4F7CD00D",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
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
                    table.PrimaryKey("PK__classes__FDF479865BC9999C", x => x.class_id);
                    table.ForeignKey(
                        name: "FK__classes__head_te__5CD6CB2B",
                        column: x => x.head_teacher_id,
                        principalTable: "teacher",
                        principalColumn: "teacher_id");
                });

            migrationBuilder.CreateTable(
                name: "grades",
                columns: table => new
                {
                    grade_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    grade_value = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    student_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    entry_date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__grades__3A8F732CB19F1828", x => x.grade_id);
                    table.ForeignKey(
                        name: "FK__grades__student___6E01572D",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
                    table.ForeignKey(
                        name: "FK__grades__subject___6D0D32F4",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__grades__teacher___6EF57B66",
                        column: x => x.teacher_id,
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
                    table.PrimaryKey("PK__teacher___16AE381830780335", x => new { x.teacher_id, x.subject_id });
                    table.ForeignKey(
                        name: "FK__teacher_s__subje__5629CD9C",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__teacher_s__teach__5535A963",
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
                    date_due = table.Column<DateOnly>(type: "date", nullable: false),
                    subject_link = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__homework__FD60442A6A30E660", x => x.homework_id);
                    table.ForeignKey(
                        name: "FK__homework___class__71D1E811",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK__homework___subje__72C60C4A",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                });

            migrationBuilder.CreateTable(
                name: "student_class",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__student___55EC4102B001E1B4", x => new { x.student_id, x.class_id });
                    table.ForeignKey(
                        name: "FK__student_c__class__60A75C0F",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK__student_c__stude__5FB337D6",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "weekly_schedules",
                columns: table => new
                {
                    schedule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    time = table.Column<TimeOnly>(type: "time", nullable: false),
                    location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__weekly_s__C46A8A6FD887C6DA", x => x.schedule_id);
                    table.ForeignKey(
                        name: "FK__weekly_sc__class__6477ECF3",
                        column: x => x.class_id,
                        principalTable: "classes",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK__weekly_sc__subje__6383C8BA",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "subject_id");
                    table.ForeignKey(
                        name: "FK__weekly_sc__teach__656C112C",
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
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__attendan__D682C7D756588763", x => new { x.lesson_id, x.student_id });
                    table.ForeignKey(
                        name: "FK__attendanc__lesso__68487DD7",
                        column: x => x.lesson_id,
                        principalTable: "weekly_schedules",
                        principalColumn: "schedule_id");
                    table.ForeignKey(
                        name: "FK__attendanc__stude__693CA210",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_attendance_student_id",
                table: "attendance",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_classes_head_teacher_id",
                table: "classes",
                column: "head_teacher_id");

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
                name: "IX_parent_student_student_id",
                table: "parent_student",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_class_class_id",
                table: "student_class",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_teacher_subjects_subject_id",
                table: "teacher_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "users",
                column: "normalized_email",
                unique: true,
                filter: "[normalized_email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true,
                filter: "[email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_users_user_name",
                table: "users",
                column: "user_name",
                unique: true,
                filter: "[user_name] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "users",
                column: "normalized_user_name",
                unique: true,
                filter: "[normalized_user_name] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_weekly_schedules_class_id",
                table: "weekly_schedules",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_weekly_schedules_subject_id",
                table: "weekly_schedules",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_weekly_schedules_teacher_id",
                table: "weekly_schedules",
                column: "teacher_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "attendance");

            migrationBuilder.DropTable(
                name: "grades");

            migrationBuilder.DropTable(
                name: "homework_items");

            migrationBuilder.DropTable(
                name: "parent_student");

            migrationBuilder.DropTable(
                name: "student_class");

            migrationBuilder.DropTable(
                name: "teacher_subjects");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "weekly_schedules");

            migrationBuilder.DropTable(
                name: "parent");

            migrationBuilder.DropTable(
                name: "student");

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
