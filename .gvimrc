set gfn=Monaco:h12 " Sets the font to use
colorscheme vibrantink " Sets the color scheme to use for syntax highlighting
set guioptions-=L " Removes the left-hand scroll bar if window is vertically split
set guioptions-=r " Stops right-hand scroll bar from being *always* present
set guioptions-=T " Hide the toolbar
if isdirectory(@%) == 1 " If I'm opening a project directory
	set lines=45
	set columns=168 " Open a double-width screen so I can split vertically
else
	set lines=45
	set columns=84 " Default to being able to read 80 cols
endif
