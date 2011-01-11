set wrap
set nolist
set softtabstop=2
set scrolloff=3
set number
set ruler
set backspace=indent,eol,start

set ignorecase
set smartcase

set showcmd
set showmode
set title
set visualbell

set autochdir
set wildmode=list:longest
set nobackup
set nowritebackup
set directory=$HOME/.vim/tmp/,.

set laststatus=2

colorscheme vibrantink
map <LEADER>t :FuzzyFinderTextMate<Enter>
map <F2> :NERDTreeToggle<Enter>