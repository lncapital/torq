package views

import (
	"github.com/cockroachdb/errors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/jmoiron/sqlx/types"
	"github.com/lncapital/torq/pkg/server_errors"
	"net/http"
	"strconv"
	"time"
)

type TableView struct {
	Id   int            `json:"id" db:"id"`
	View types.JSONText `json:"view" db:"view"`
}

func getTableViewsHandler(c *gin.Context, db *sqlx.DB) {

	r, err := getTableViews(db)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}
	c.JSON(http.StatusOK, r)
}

func getTableViews(db *sqlx.DB) (r []*TableView, err error) {
	sql := `Select id, view from table_view order by view_order;`

	rows, err := db.Query(sql)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		v := &TableView{}

		err = rows.Scan(&v.Id, &v.View)
		if err != nil {
			return r, err
		}

		// Append to the result
		r = append(r, v)
	}
	return r, nil
}

type NewTableView struct {
	View types.JSONText `json:"view" db:"view"`
}

func insertTableViewsHandler(c *gin.Context, db *sqlx.DB) {

	view := &NewTableView{}
	err := c.BindJSON(&view)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}

	r, err := insertTableView(db, view)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}
	c.JSON(http.StatusOK, r)
}

func insertTableView(db *sqlx.DB, view *NewTableView) (r TableView, err error) {

	sql := `
		INSERT INTO table_view (view, created_on) values ($1, $2)
		RETURNING id, view;
	`

	err = db.QueryRowx(sql, &view.View, time.Now().UTC()).Scan(&r.Id, &r.View)
	if err != nil {
		return TableView{}, errors.Wrap(err, "Unable to create view. SQL statement error")
	}

	return r, nil
}

func updateTableViewHandler(c *gin.Context, db *sqlx.DB) {

	view := &TableView{}
	err := c.BindJSON(view)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}

	r, err := updateTableView(db, view)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}
	c.JSON(http.StatusOK, r)
}

func updateTableView(db *sqlx.DB, view *TableView) (TableView, error) {

	sql := `UPDATE table_view SET view = $1, updated_on = $2 WHERE id = $3;`

	_, err := db.Exec(sql, &view.View, time.Now().UTC(), &view.Id)
	if err != nil {
		return TableView{}, errors.Wrap(err, "Unable to create view. SQL statement error")
	}

	return *view, nil
}

func deleteTableViewsHandler(c *gin.Context, db *sqlx.DB) {

	id, err := strconv.Atoi(c.Param("viewId"))
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}

	err = deleteTableView(db, id)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}
	c.Status(http.StatusOK)
}

func deleteTableView(db *sqlx.DB, id int) error {

	sql := `DELETE FROM table_view WHERE id = $1;`

	_, err := db.Exec(sql, id)
	if err != nil {
		return errors.Wrap(err, "Unable to create view. SQL statement error")
	}

	return nil
}

func updateTableViewOrderHandler(c *gin.Context, db *sqlx.DB) {

	var viewOrders []*TableViewOrder
	err := c.BindJSON(&viewOrders)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}

	err = updateTableViewOrder(db, viewOrders)
	if err != nil {
		server_errors.LogAndSendServerError(c, err)
		return
	}
	c.Status(http.StatusOK)
}

type TableViewOrder struct {
	Id        int `json:"id" db:"id"`
	ViewOrder int `json:"view_order" db:"view_order"`
}

func updateTableViewOrder(db *sqlx.DB, viewOrders []*TableViewOrder) error {

	// TODO: Switch tp updating using this and add Unique constraint
	//sql := `
	//	update table_view set view_order = temp_table.view_order
	//	from (values
	//		(78,  1),
	//		(79,  3),
	//		(81,  2)
	//	) as temp_table(id, view_order)
	//	where temp_table.id = table_view.id;
	//`

	sql := `
		update table_view set view_order = $1
		where id = $2;
	`
	tx := db.MustBegin()
	for _, order := range viewOrders {
		_, err := tx.Exec(sql, order.ViewOrder, order.Id)
		if err != nil {
			return errors.Wrap(err, "Unable to update view order. SQL statement error")
		}
	}

	err := tx.Commit()
	if err != nil {
		return errors.Wrap(err, "Unable to commit update view order. SQL statement error")
	}

	return nil
}
