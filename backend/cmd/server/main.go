package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/IZO-Ong/gridgo/maze"
)

func main() {
	// endpoint for maze generation
	http.HandleFunc("/api/maze/generate", handleGenerateMaze)

	println("GridGo API running on :8080")
	http.ListenAndServe(":8080", nil)
}

func handleGenerateMaze(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method == http.MethodOptions {
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// parse metadata
	r.ParseMultipartForm(10 << 20) // 10MB
	rows, _ := strconv.Atoi(r.FormValue("rows"))
	cols, _ := strconv.Atoi(r.FormValue("cols"))
	genType := r.FormValue("type") // image, kruskal or recursive

	myMaze := maze.NewMaze(rows, cols)

	switch genType {
	case "image":
		file, _, err := r.FormFile("image")
		if err != nil {
			http.Error(w, "Image required for image-type maze", http.StatusBadRequest)
			return
		}
		defer file.Close()

		weights, err := maze.GetEdgeWeights(file, rows, cols)
		if err != nil {
			http.Error(w, "Vision processing failed", http.StatusInternalServerError)
			return
		}
		myMaze.GenerateImageMaze(weights)

	case "kruskal":
		myMaze.GenerateKruskal()

	case "recursive":
		myMaze.GenerateRecursive(0, 0)

	default:
		http.Error(w, "Invalid generation type", http.StatusBadRequest)
		return
	}

	// return as JSON
	myMaze.SetRandomStartEnd()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(myMaze)
}
