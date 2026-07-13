using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NemetschekDnevnik.Server.Migrations
{
    /// <inheritdoc />
    public partial class dbseedertest4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens");

            migrationBuilder.AddForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens");

            migrationBuilder.AddForeignKey(
                name: "FK_refresh_tokens_users",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
