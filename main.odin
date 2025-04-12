package main

import http "./odin-http"
import "core:fmt"
import "core:log"
import "core:net"
import "core:strings"
import "core:time"

print :: fmt.println
printf :: fmt.printfln
tprint :: fmt.tprintln
tprintf :: fmt.tprintfln

// TODO: get these from .env
cors_allow := [?]string{"http://localhost:3000"}

main :: proc() {
	context.logger = log.create_console_logger(.Info)

	s: http.Server
	// Register a graceful shutdown when the program receives a SIGINT signal.
	http.server_shutdown_on_interrupt(&s)

	// Set up routing
	router: http.Router
	http.router_init(&router)
	defer http.router_destroy(&router)

	http.route_get(&router, "/pages/(.*)", http.handler(get_page))

	routed := http.router_handler(&router)

	log.info("Listening on http://localhost:8000")

	err := http.listen_and_serve(&s, routed, net.Endpoint{address = net.IP4_Loopback, port = 8000})
	fmt.assertf(err == nil, "server stopped with error: %v", err)
}


PAGE_TYPE :: enum {
	TEXT,
	KANBAN,
}

Card :: struct {
	title:       string,
	description: string,
}

TabCategory :: struct {
	title: string,
	cards: []Card,
}

PageTab :: struct {
	title:      string,
	type:       PAGE_TYPE,
	order:      int,
	// categories only exist if page type is KANBAN
	categories: Maybe([]TabCategory),
	// text only exists if page type is TEXT
	text:       string,
}

PageResponse :: struct {
	title:         string,
	backgroundUrl: Maybe(string),
	tabs:          []PageTab,
}

get_page :: proc(req: ^http.Request, res: ^http.Response) {
	set_cors(res)

	if len(req.url_params) <= 0 {
		http.respond_with_status(res, .Bad_Request)
		return
	}

	test_cards := [?]Card {
		{title = "First Card"},
		{title = "Second Card", description = "second card description"},
	}
	test_cards_2 := [?]Card {
		{title = "Third Card", description = "third card description"},
		{title = "Fourth Card", description = "fourth card description"},
	}

	first_tab_categories := [?]TabCategory {
		{title = "Features", cards = test_cards[:]},
		{title = "Bugs", cards = test_cards_2[:]},
	}
	second_tab_categories := [?]TabCategory{{title = "TODO"}}

	tabs := [?]PageTab {
		{
			title = "Dev Notes",
			type = .TEXT,
			text = "# Dev Notes\n## Welcome to dev notes!\nheythere\n### third heading\nanother p",
			order = 0,
		},
		{title = "Dev Kanban", type = .KANBAN, categories = first_tab_categories[:], order = 1},
		{
			title = "Design Kanban",
			type = .KANBAN,
			categories = second_tab_categories[:],
			order = 2,
		},
	}

	sample_page_response := PageResponse {
		title = "Test Page",
		tabs  = tabs[:],
	}

	if req.url_params[0] == "project-1" {
		page_response := sample_page_response

		http.respond_json(res, page_response)
	} else {
		http.respond_with_status(res, .Not_Found)
	}
}

set_cors :: proc(res: ^http.Response) {
	http.headers_set(&res.headers, "Access-Control-Allow-Origin", strings.join(cors_allow[:], ","))
}
