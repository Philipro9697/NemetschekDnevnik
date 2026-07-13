using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NemetschekDnevnik.Server.Migrations
{
    /// <inheritdoc />
    public partial class dbseedertest5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__attendanc__lesso__6477ECF3",
                table: "attendance");

            migrationBuilder.DropForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens");

            migrationBuilder.DropForeignKey(
                name: "FK__remarks__student__70DDC3D8",
                table: "remarks");

            migrationBuilder.AddForeignKey(
                name: "FK__attendanc__lesso__6477ECF3",
                table: "attendance",
                column: "lesson_id",
                principalTable: "lessons",
                principalColumn: "lesson_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK__remarks__student__70DDC3D8",
                table: "remarks",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__attendanc__lesso__6477ECF3",
                table: "attendance");

            migrationBuilder.DropForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens");

            migrationBuilder.DropForeignKey(
                name: "FK__remarks__student__70DDC3D8",
                table: "remarks");

            migrationBuilder.AddForeignKey(
                name: "FK__attendanc__lesso__6477ECF3",
                table: "attendance",
                column: "lesson_id",
                principalTable: "lessons",
                principalColumn: "lesson_id");

            migrationBuilder.AddForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK__remarks__student__70DDC3D8",
                table: "remarks",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id");
        }
    }
}
