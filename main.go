package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/wilmaabya/studybuddy/config"
	"github.com/wilmaabya/studybuddy/controllers"
	"github.com/wilmaabya/studybuddy/middlewares"
	"github.com/wilmaabya/studybuddy/models"
)

func main() {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		// contoh dsn: host=localhost user=postgres password=pass dbname=studybuddy_db port=5432 sslmode=disable TimeZone=Asia/Jakarta
		dsn = "host=localhost user=postgres password=W1lmaaa! dbname=studybuddy_db port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	}

	if err := config.ConnectDatabase(dsn); err != nil {
		log.Fatal("failed connect db:", err)
	}

	// AutoMigrate (buat pemula ini enak)
	db := config.DB
	db.AutoMigrate(&models.User{}, &models.Class{}, &models.ClassMember{})

	r := gin.Default()

	// === FIX CORS ===
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Auth routes
	r.POST("/auth/register", controllers.Register)
	r.POST("/auth/login", controllers.Login)

	// class routes (some protected)
	r.POST("/classes", middlewares.AuthMiddleware(), controllers.CreateClass)
	r.GET("/classes", controllers.ListClasses)
	r.GET("/classes/:id", controllers.GetClass)
	r.POST("/classes/:id/join", middlewares.AuthMiddleware(), controllers.JoinClass)
	r.POST("/classes/:id/leave", middlewares.AuthMiddleware(), controllers.LeaveClass)
	r.GET("/classes/:id/members", middlewares.AuthMiddleware(), controllers.GetClassMembers)
	r.GET("/users/me/classes", middlewares.AuthMiddleware(), controllers.GetMyClasses)
	r.DELETE("/classes/:id/leave", middlewares.AuthMiddleware(), controllers.LeaveClass)
	r.GET("/users/me/created-classes", middlewares.AuthMiddleware(), controllers.GetCreatedClasses)
	r.DELETE("/classes/:id", middlewares.AuthMiddleware(), controllers.DeleteClass)

	// health
	r.GET("/ping", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"message": "pong", "time": time.Now()}) })

	r.Run(":8080")
}
