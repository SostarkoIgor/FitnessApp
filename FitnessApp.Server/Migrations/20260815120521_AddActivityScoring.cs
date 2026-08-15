using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityScoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PointsPerUnit",
                table: "Sports",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "FitnessActivities",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Sports",
                keyColumn: "Id",
                keyValue: 1,
                column: "PointsPerUnit",
                value: 100m);

            migrationBuilder.UpdateData(
                table: "Sports",
                keyColumn: "Id",
                keyValue: 2,
                column: "PointsPerUnit",
                value: 50m);

            migrationBuilder.UpdateData(
                table: "Sports",
                keyColumn: "Id",
                keyValue: 3,
                column: "PointsPerUnit",
                value: 25m);

            migrationBuilder.UpdateData(
                table: "Sports",
                keyColumn: "Id",
                keyValue: 4,
                column: "PointsPerUnit",
                value: 5m);

            migrationBuilder.UpdateData(
                table: "Sports",
                keyColumn: "Id",
                keyValue: 5,
                column: "PointsPerUnit",
                value: 15m);

            migrationBuilder.UpdateData(
                table: "Sports",
                keyColumn: "Id",
                keyValue: 6,
                column: "PointsPerUnit",
                value: 1m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PointsPerUnit",
                table: "Sports");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "FitnessActivities");
        }
    }
}
