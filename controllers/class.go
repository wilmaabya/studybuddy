package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wilmaabya/studybuddy/config"
	"github.com/wilmaabya/studybuddy/models"
)

type CreateClassInput struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Schedule    time.Time `json:"schedule" time_format:"2006-01-02T15:04:05Z"`
	MaxMember   int       `json:"max_member" binding:"required"`
}

func CreateClass(c *gin.Context) {
	var input CreateClassInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	class := models.Class{
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Schedule:    input.Schedule,
		MaxMember:   input.MaxMember,
		CreatedBy:   userID.(uint),
	}
	if err := config.DB.Create(&class).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"class": class})
}
func UpdateClass(c *gin.Context) {
	id := c.Param("id")
	var class models.Class

	if err := config.DB.First(&class, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "class not found"})
		return
	}

	var input CreateClassInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated := models.Class{
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Schedule:    input.Schedule,
		MaxMember:   input.MaxMember,
	}

	if err := config.DB.Model(&class).Updates(updated).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"class": class})
}

func DeleteClass(c *gin.Context) {
	id := c.Param("id")

	var class models.Class
	if err := config.DB.First(&class, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	config.DB.Delete(&class)
	c.JSON(http.StatusOK, gin.H{"message": "Class deleted"})
}

func ListClasses(c *gin.Context) {
	var classes []map[string]interface{}

	if err := config.DB.
		Table("classes as c").
		Select("c.id, c.title, c.description, c.category, c.schedule, c.max_member, c.created_by, u.name as tutor_name").
		Joins("left join users u on u.id = c.created_by").
		Scan(&classes).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"classes": classes})
}

func GetClass(c *gin.Context) {
	id := c.Param("id")
	var class models.Class
	if err := config.DB.First(&class, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "class not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"class": class})
}

// GetClassMembers returns list of users who joined a class
func GetClassMembers(c *gin.Context) {
	classID := c.Param("id")
	cid, err := strconv.ParseUint(classID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class id"})
		return
	}

	var members []models.User
	// join class_members -> users to get user info
	if err := config.DB.
		Table("class_members").
		Select("users.id, users.name, users.email, users.created_at").
		Joins("join users on users.id = class_members.user_id").
		Where("class_members.class_id = ?", uint(cid)).
		Scan(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"members": members})
}

func JoinClass(c *gin.Context) {
	classID := c.Param("id")
	userID, _ := c.Get("user_id")

	cid := parseUint(classID)
	uid := userID.(uint)

	// 1. cek apakah class ada
	var cls models.Class
	if err := config.DB.First(&cls, cid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "class not found"})
		return
	}

	// 2. cek apakah user sudah join
	var existing models.ClassMember
	if err := config.DB.Where("user_id = ? AND class_id = ?", uid, cid).First(&existing).Error; err == nil {
		// found -> already joined
		c.JSON(http.StatusBadRequest, gin.H{"error": "already joined"})
		return
	}

	// 3. cek kapasitas
	var count int64
	config.DB.Model(&models.ClassMember{}).Where("class_id = ?", cid).Count(&count)
	if int(count) >= cls.MaxMember {
		c.JSON(http.StatusBadRequest, gin.H{"error": "class is full"})
		return
	}

	// 4. buat membership
	membership := models.ClassMember{
		UserID:  uid,
		ClassID: cid,
	}
	if err := config.DB.Create(&membership).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "joined class"})
}

// LeaveClass: user leaves a class
func LeaveClass(c *gin.Context) {
	classID := c.Param("id")
	userID, _ := c.Get("user_id")

	cid := parseUint(classID)
	uid := userID.(uint)

	// cek apakah membership ada
	var membership models.ClassMember
	if err := config.DB.Where("user_id = ? AND class_id = ?", uid, cid).First(&membership).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not a member"})
		return
	}

	// delete membership
	if err := config.DB.Delete(&membership).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "left class"})
}

func GetMyClasses(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid := userID.(uint)

	var classes []models.Class
	if err := config.DB.
		Table("classes").
		Select("classes.*").
		Joins("join class_members on class_members.class_id = classes.id").
		Where("class_members.user_id = ?", uid).
		Scan(&classes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"classes": classes})
}

// GetCreatedClasses returns classes created by current user
func GetCreatedClasses(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid := userID.(uint)

	var classes []models.Class
	if err := config.DB.Where("created_by = ?", uid).Find(&classes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"classes": classes})
}

func parseUint(id string) uint {
	v, _ := strconv.ParseUint(id, 10, 32)
	return uint(v)
}

func ProtectedCreateClass(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "ProtectedCreateClass endpoint berhasil dipanggil",
	})
}
