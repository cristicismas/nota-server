package main

import http "./odin-http"
import "core:fmt"
import "core:log"
import "core:net"
import "core:os"
import "core:strings"
import "core:time"

print :: fmt.println
printf :: fmt.printfln
tprint :: fmt.tprintln
tprintf :: fmt.tprintfln

cors_allow: []string

main :: proc() {
	context.logger = log.create_console_logger(.Info)

	env_vars, env_error := parse_env()
	defer delete(env_vars)

	if env_error != nil {
		switch env_error {
		case .NOT_FOUND:
			fmt.eprintln("File .env doesn't exist but is required for this server to run.")
			return
		case .INVALID_FORMAT:
			fmt.eprintln("Invalid .env format, please make sure there aren't any anomalies.")
			return
		}
	}

	if "ALLOW_ORIGINS" in env_vars {
		cors_allow = strings.split(env_vars["ALLOW_ORIGINS"], ",")
	} else {
		log.warn("No ALLOW_ORIGINS env key present, this might result CORS issues.")
	}

	s: http.Server
	// Register a graceful shutdown when the program receives a SIGINT signal.
	http.server_shutdown_on_interrupt(&s)

	// Set up routing
	router: http.Router
	http.router_init(&router)
	defer http.router_destroy(&router)

	http.route_get(&router, "/pages", http.handler(get_all_pages))
	http.route_get(&router, "/pages/(.*)", http.handler(get_page))

	routed := http.router_handler(&router)

	print("Listening on http://localhost:8000")

	err := http.listen_and_serve(&s, routed, net.Endpoint{address = net.IP4_Loopback, port = 8000})
	fmt.assertf(err == nil, "server stopped with error: %v", err)
}

PARSE_ENV_ERROR :: enum {
	NOT_FOUND,
	INVALID_FORMAT,
}

parse_env :: proc() -> (kv_pairs: map[string]string, error: PARSE_ENV_ERROR) {
	data, ok := os.read_entire_file(".env", context.allocator)
	if !ok {
		return {}, .NOT_FOUND
	}

	str := string(data)
	for line in strings.split_lines_iterator(&str) {
		trimmed_string := strings.trim(line, "")

		// Skip empty lines
		if len(trimmed_string) == 0 {
			continue
		}

		// Skip comments
		if strings.starts_with(trimmed_string, "#") {
			continue
		}

		split_line := strings.split(line, "=")

		if len(split_line) != 2 || len(split_line[0]) == 0 {
			return {}, .INVALID_FORMAT
		}

		kv_pairs[split_line[0]] = split_line[1]
	}

	return kv_pairs, nil
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

PageLink :: struct {
	slug:  string,
	title: string,
	icon:  Maybe(string),
}

get_all_pages :: proc(req: ^http.Request, res: ^http.Response) {
	set_cors(res)

	pages := [?]PageLink {
		{slug = "project-1", title = "Project 1"},
		{slug = "project-3", title = "Project 2"},
		{slug = "project-3", title = "Project 3"},
	}

	http.respond_json(res, pages)
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
