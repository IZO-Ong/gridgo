package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/IZO-Ong/gridgo/maze"
)

func main() {
	mux := http.NewServeMux()
	
	mux.HandleFunc("/api/maze/generate", handleGenerateMaze)
	mux.HandleFunc("/api/maze/render", handleRenderMaze)
	mux.HandleFunc("/api/maze/solve", handleSolveMaze)

	println("GridGo API running on port 8080")
	http.ListenAndServe(":8080", enableCORS(mux))
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") 
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func handleGenerateMaze(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		return
	}

	if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // parse metadata
    err := r.ParseMultipartForm(10 << 20)
    if err != nil {
        http.Error(w, "Failed to parse form", http.StatusBadRequest)
        return
    }

    rows, _ := strconv.Atoi(r.FormValue("rows"))
    cols, _ := strconv.Atoi(r.FormValue("cols"))

    // check boundary
    if rows < 2 || rows > 300 || cols < 2 || cols > 300 {
        http.Error(w, "OUT_OF_BOUNDS: Dimensions must be between 2 and 300", http.StatusBadRequest)
        return
    }

    genType := r.FormValue("type")
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

func handleRenderMaze(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    if r.Method == http.MethodOptions { return }

    var m maze.Maze
    if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
        http.Error(w, "Invalid data", http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "image/png")
    m.RenderToWriter(w, 10) 
}

func handleSolveMaze(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions { return }
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		Maze      maze.Maze `json:"maze"`
		Algorithm string    `json:"algorithm"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	var visited [][2]int
	var path [][2]int

	switch payload.Algorithm {
	case "astar":
		visited, path = payload.Maze.SolveAStar()
	case "bfs":
		visited, path = payload.Maze.SolveBFS()
	case "dfs":
		visited, path = payload.Maze.SolveDFS()
	default:
		http.Error(w, "Unsupported algorithm", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"visited": visited,
		"path":    path,
	})
}