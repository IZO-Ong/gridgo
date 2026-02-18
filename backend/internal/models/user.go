package models

import (
	"time"
)

type User struct {
    ID           string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    Username     string    `gorm:"uniqueIndex;not null"`
    Email        string    `gorm:"uniqueIndex;not null"`
    PasswordHash string    `gorm:"not null"`
    CreatedAt    time.Time
    Mazes        []Maze    `gorm:"foreignKey:CreatorID"`
}

type PendingUser struct {
    Email        string    `gorm:"primaryKey"`
    Username     string    `gorm:"not null"`
    PasswordHash string    `gorm:"not null"`
    OTP          string    `gorm:"not null"`
    ExpiresAt    time.Time `gorm:"not null"`
}