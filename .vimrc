scriptencoding utf-8 " Sets the script encoding
set nowrap " Default to not wrapping text. HAML and JS can look a mess if we do
set nocompatible " Don't try and be compatible with plain ol' Vi
set autoindent " Automatically indent new lines...
set smartindent " And try and do it intelligently
set showmatch " Highly matching brace/bracket to char under cursor
set nolist " Hides end of line and other characters I don't really care about
set softtabstop=2 " Use two spaces as a replacement for tabs
set scrolloff=5 " Keep 5 lines visible above and below the cursor when scrolling
set sidescrolloff=5 " Keep 5 characters either side when scrolling horizontally
set number " Display line number
set ruler "Display cursor position
set backspace=indent,eol,start " Allow backspacing over autoindent, line breaks, and the start of an insert
syntax on " Turn on syntax highlighting
set ignorecase " Ignore case in search patterns
set smartcase " Override previous ignorecase if search patter contains an uppercase char
filetype plugin indent on " Enable the loading of plugin and indent files
set list listchars=tab:»·,trail:· " Characters to who in place of tabs and trailing spaces
set isk+=_,$,@,%,#,-,?,%,& " none of these should be word dividers, so make them not be
set lz " do not redraw while running macros (much faster) (LazyRedraw)
set spell " Turns on spell check
set spelllang=en_gb,en_us,en " Sets the dictionaries to use
set ttyfast " Turns on fast terminal connection. You're probably working directly on the terminal
set completeopt= " don't use a pop up menu for completions
set shiftround " when at 3 spaces, and I hit > ... go to 4, not 5

" Folding {
    set foldenable " Turn on folding
    set foldmarker={,} " Fold C style code (only use this as default
                        " if you use a high foldlevel)
    set foldmethod=marker " Fold on the marker
    set foldlevel=100 " Don't autofold anything (but I can still
                      " fold manually)
    set foldopen=block,hor,mark,percent,quickfix,tag " what movements
                                                      " open folds
    function! SimpleFoldText() " {
        return getline(v:foldstart).' '
    endfunction " }
    set foldtext=SimpleFoldText() " Custom fold text function
                                   " (cleaner than default)
" }


set showcmd " Show the current command at the bottom of the screen
set showmode " Show the current Vi mode
set title " Set the title of the window to the current filename
set visualbell " Use a visual cue instead of beeping
set incsearch " Match searches as the are typed
set hidden " Hide open documents when switching files, don't unload them

set wildmenu " Display possible matches when auto-completing
set wildmode=list:longest " List the matches, and continue to do so until we get to the longest common string
set wildignore+=*.o,*.obj,.git,tmp,log " These files are ignored when matching file or directory names
set nobackup " Don't make a backup before overwriting a file
set nowritebackup " Still don't make a backup (setting to true writes one but deletes it if overwriting was successful)
set directory=.,$HOME/tmp,/var/tmp,/tmp " Directory names for the swap files

set laststatus=1 " Display a status line only if we have multiple windows

let mapleader = "," " Set the leader to ,

" kill trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

" Auto-indent settings

" Auto-completion settings

" Key mappings
command! Reloadvimsource source $MYVIMRC
nmap <silent> <leader>. :Reloadvimsource<Enter>
cmap W w

" Break bad habits
map <down> <nop>
map <left> <nop>
map <right> <nop>
map <up> <nop>

imap <down> <nop>
imap <left> <nop>
imap <right> <nop>
imap <up> <nop>

imap <C-h> <Left>
imap <C-j> <Down>
imap <C-k> <Up>
imap <C-l> <Right>


if isdirectory(@%) == 1
	vsplit
endif
