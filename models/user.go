package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Password  string    `json:"-"`                             // don't return password
	Role      string    `json:"role" gorm:"default:'student'"` // "student" or "tutor" or "admin"
	CreatedAt time.Time `json:"created_at"`
}
