package httpapi

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	NewRouter().ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("esperaba 200 y llegó %d", w.Code)
	}
}
