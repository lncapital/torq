package server_errors

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

/*
Error structure expected by the front end
{
	"errors": {
		"fields": {
			"email": ["The email field is required", "The email field must be a valid email"],
			"name": ["The email field is required"],
			"age": ["The age field must be a valid number"]
		},
		"server": [
			"Bad request to the server",
			"Email or password wrong"
		]
	}
}
*/

type ServerError struct {
	Errors struct {
		Fields map[string][]string `json:"fields"`
		Server []string            `json:"server"`
	} `json:"errors"`
}

func (se *ServerError) AddFieldError(field string, fieldError string) {
	if se.Errors.Fields == nil {
		se.Errors.Fields = make(map[string][]string)
	}
	if _, exists := se.Errors.Fields[field]; !exists {
		se.Errors.Fields[field] = []string{}
	}
	se.Errors.Fields[field] = append(se.Errors.Fields[field], fieldError)
}

func (se *ServerError) AddServerError(serverErrorDescription string) {
	se.Errors.Server = append(se.Errors.Server, serverErrorDescription)
}

func SingleServerError(serverErrorDescription string) *ServerError {
	serverError := &ServerError{}
	serverError.AddServerError(serverErrorDescription)
	return serverError
}

func SingleFieldError(field string, fieldError string) *ServerError {
	serverError := &ServerError{}
	serverError.AddFieldError(field, fieldError)
	return serverError
}

func LogAndSendServerError(c *gin.Context, err error) {
	log.Printf("Error: %+v\n", err)
	c.JSON(http.StatusInternalServerError, SingleServerError("Server error"))
}
