package main

import (
	"log"

	"github.com/jluisv16/kuntur-hotels/backend/internal/config"
	"github.com/jluisv16/kuntur-hotels/backend/internal/httpapi"
)

func main() {
	cfg := config.Load()
	r := httpapi.NewRouter()
	log.Printf("Kuntur API escuchando en :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
