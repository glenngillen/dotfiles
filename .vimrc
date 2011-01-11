set nocompatible
set autoindent
set smartindent
set showmatch
set wrap
set nolist
set softtabstop=2
set scrolloff=3
set number
set ruler
set backspace=indent,eol,start
syntax on
set ignorecase
set smartcase
filetype plugin indent on

set showcmd
set showmode
set title
set visualbell
set incsearch

set autochdir
set wildmode=list:longest
set nobackup
set nowritebackup
set directory=$HOME/.vim/tmp/,.


set laststatus=2

let NERDTreeIgnore=['\.git$', '^tmp$', '^log$','^\..*\.swp$']
let NERDTreeShowHidden=1
let NERDTreeChDirMode=1
colorscheme vibrantink
map <LEADER>t :FuzzyFinderTextMate<Enter>
map <F2> :NERDTreeToggle<Enter>