// BESPOKE file-based database, probably stupidly slow, good enough for me
package file_db

import "core:fmt"
import "core:log"
import "core:os"

DB :: struct {
	users: []string,
}

main :: proc() {
	db: DB

	cwd := os.get_current_directory()

	create_dir_if_non_existent(".data")
	create_dir_if_non_existent(".data/users")
}

create_dir_if_non_existent :: proc(dir_name: string) {
	cwd := os.get_current_directory()

	handle, err := os.open(cwd)
	defer os.close(handle)

	if err != os.ERROR_NONE {
		log.error("Failed to read db files: ", err)
	}

	target_dir_path := fmt.aprintf("%s/%s", cwd, dir_name)
	defer delete(target_dir_path)

	make_dir_error := os.make_directory(target_dir_path)

	if make_dir_error == os.Platform_Error.EEXIST {
		return
	} else if make_dir_error != nil {
		log.error(make_dir_error)
		log.errorf("Failed to create %s/ directory. Exitting program...", dir_name)
		os.exit(2)
	}
}
