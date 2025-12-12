package models

import "time"

type Class struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Schedule    time.Time `json:"schedule"`
	MaxMember   int       `json:"max_member"`
	CreatedBy   uint      `json:"created_by"`
	TutorName   string    `json:"tutor_name"`
}
