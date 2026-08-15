using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddFitnessActivityUserForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_FitnessActivities_AspNetUsers_UserId",
                table: "FitnessActivities",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FitnessActivities_AspNetUsers_UserId",
                table: "FitnessActivities");
        }
    }
}
