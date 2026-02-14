export async function generateMaze(formData: FormData) {
    const response = await fetch("http://localhost:8080/api/maze/generate", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to generate maze");
  }
  
  return response.json();
}