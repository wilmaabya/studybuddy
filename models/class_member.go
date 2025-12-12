package models

type ClassMember struct {
	ID      uint `gorm:"primaryKey" json:"id"`
	UserID  uint `json:"user_id"`
	ClassID uint `json:"class_id"`
}
