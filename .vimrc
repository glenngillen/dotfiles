scriptencoding utf-8
set nowrap
set nocompatible
set autoindent
set smartindent
set showmatch
set nolist
set softtabstop=2
set scrolloff=5
set sidescrolloff=5
set number
set ruler
set backspace=indent,eol,start
syntax on
set ignorecase
set smartcase
filetype plugin indent on
set list listchars=tab:»·,trail:·
set isk+=_,$,@,%,#,-,?,%,& " none of these should be word dividers, so make them not be
set lz " do not redraw while running macros (much faster) (LazyRedraw)
" set spell
" set spelllang=en_ca,en_gb,en_us,en
set ttyfast
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


set showcmd
set showmode
set title
set visualbell
set incsearch
set hidden

set wildmenu
set wildmode=list:longest
set wildignore+=*.o,*.obj,.git,tmp,log
set nobackup
set nowritebackup
set directory=$HOME/tmp

set laststatus=2
call pathogen#runtime_append_all_bundles()

let NERDTreeIgnore=['\.git$', '^tmp$', '^log$','^\..*\.swp$','\.bundle$']
let NERDTreeChDirMode=1
let NERDShutUp=1
let NERDTreeQuitOnOpen=1
let NERDChristmasTree = 1
let NERDTreeHighlightCursorline = 1
let NERDTreeShowHidden = 1

colorscheme vibrantink
let mapleader = ","

" kill whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

autocmd FileType ruby,eruby,yaml set autoindent shiftwidth=2 softtabstop=2 tabstop=2 expandtab
autocmd FileType javascript set autoindent shiftwidth=4 softtabstop=4 tabstop=4 expandtab

autocmd FileType ruby set omnifunc=rubycomplete#Complete
autocmd FileType python set omnifunc=pythoncomplete#Complete
autocmd FileType javascript set omnifunc=javascriptcomplete#CompleteJS
autocmd FileType html set omnifunc=htmlcomplete#CompleteTags
autocmd FileType css set omnifunc=csscomplete#CompleteCSS
autocmd FileType xml set omnifunc=xmlcomplete#CompleteTags
autocmd FileType php set omnifunc=phpcomplete#CompletePHP
autocmd FileType c set omnifunc=ccomplete#Complete
" autocmd BufReadPost *
"     \ if line("'\"") > 1 && line("'\"") <= line("$") |
"     \   exe "normal! g`\"" |
"     \ endif


nmap <silent> <leader>d :NERDTreeToggle<Enter>
nmap <leader>F :Ack<space>
nmap <silent> <leader>s :w<Enter>:RunRubyFocusedUnitTest<Enter>
nmap <silent> <leader>S :w<Enter>:RunAllRubyTests<Enter>
command! Reloadvimsource source $MYVIMRC
nmap <silent> <leader>. :Reloadvimsource<Enter>
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
