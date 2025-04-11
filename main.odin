package main

import http "./odin-http"
import "core:fmt"
import "core:log"
import "core:net"
import "core:time"

print :: fmt.println
printf :: fmt.printfln
tprint :: fmt.tprintln
tprintf :: fmt.tprintfln


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

get_page :: proc(req: ^http.Request, res: ^http.Response) {
	if len(req.url_params) <= 0 {
		http.respond_plain(res, tprintf("No page found"))
	} else {
		http.respond_plain(res, tprintf("page: %s", req.url_params[0]))
	}
}
