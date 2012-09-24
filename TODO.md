# TODO
- make the daemon take the following arguments:
	a. markdown_parser_bin
	b. static_files_dir: so that we may host images
- make the vim-script configurable, i.e. set the markdown parser, include example of
how to use our own latex headers.
- Use native python PUT-request to talk to daemon
- Better cursor-handling: maybe we should pass the cursor position to the
  frontend, and then let the frontend decide what to do with this information
- Styling? We should probably give the user an option for styling, how do we do this?
- Put scrolling and math javascript in a file so that we may cache it.
