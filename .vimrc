filetype off                   " required!
set shell=/bin/bash
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

" let Vundle manage Vundle
" required!
Plugin 'gmarik/Vundle.vim'

" vim plugins managed via Vundle
"
" github repos
Plugin 'tpope/vim-fugitive'
Plugin 'tpope/vim-bundler'
Plugin 'tpope/vim-markdown'
Plugin 'tpope/vim-endwise'
Plugin 'tpope/vim-surround'
Plugin 'tpope/vim-haml'
Plugin 'scrooloose/nerdtree'
Plugin 'Lokaltog/vim-easymotion'
Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
Plugin 'tpope/vim-rails.git'
Plugin 'jnwhiteh/vim-golang'
Plugin 'MarcWeber/vim-addon-mw-utils'
Plugin 'tomtom/tlib_vim'
Plugin 'honza/vim-snippets'
Plugin 'garbas/vim-snipmate'
Plugin 'mileszs/ack.vim'
Plugin 'kchmck/vim-coffee-script'
Plugin 'kien/ctrlp.vim'

" vim-scripts repos


" non-github repos

call vundle#end()
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
set tags+=gems.tags

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
"map <down> <nop>
"map <left> <nop>
"map <right> <nop>
"map <up> <nop>
"
"imap <down> <nop>
"imap <left> <nop>
"imap <right> <nop>
"imap <up> <nop>
"
"imap <C-h> <Left>
"imap <C-j> <Down>
"imap <C-k> <Up>
"imap <C-l> <Right>

" Plugin settings
"
" NERDTree
map <leader>d :NERDTreeToggle<Enter>
let NERDTreeIgnore = ['\.*\.sw?$']

" Fugitive
map <leader>gb :Gblame<Enter>
map <leader>gc :Gcommit<Enter>
map <leader>gs :Gstatus<Enter>
map <leader>gg :Ggrep<space>
map <leader>gmv :Gmove<space>
map <leader>grm :Gremove<space>
map <leader>gpush :Git push<Enter>
map <leader>gpull :Git pull --rebase<Enter>

" Ack
map <leader>f :Ack<space>
" Bundler
map <leader>bo :Bopen<Enter>
" CtrlP
map <leader>t :CtrlP<Enter>

if isdirectory(@%) == 1
	vsplit
endif

" If you are using a console version of Vim, or dealing
" with a file that changes externally (e.g. a web server log)
" then Vim does not always check to see if the file has been changed.
" The GUI version of Vim will check more often (for example on Focus change),
" and prompt you if you want to reload the file.
"
" There can be cases where you can be working away, and Vim does not
" realize the file has changed. This command will force Vim to check
" more often.
"
" Calling this command sets up autocommands that check to see if the
" current buffer has been modified outside of vim (using checktime)
" and, if it has, reload it for you.
"
" This check is done whenever any of the following events are triggered:
" * BufEnter
" * CursorMoved
" * CursorMovedI
" * CursorHold
" * CursorHoldI
"
" In other words, this check occurs whenever you enter a buffer, move the cursor,
" or just wait without doing anything for 'updatetime' milliseconds.
"
" Normally it will ask you if you want to load the file, even if you haven't made
" any changes in vim. This can get annoying, however, if you frequently need to reload
" the file, so if you would rather have it to reload the buffer *without*
" prompting you, add a bang (!) after the command (WatchForChanges!).
" This will set the autoread option for that buffer in addition to setting up the
" autocommands.
"
" If you want to turn *off* watching for the buffer, just call the command again while
" in the same buffer. Each time you call the command it will toggle between on and off.
"
" WatchForChanges sets autocommands that are triggered while in *any* buffer.
" If you want vim to only check for changes to that buffer while editing the buffer
" that is being watched, use WatchForChangesWhileInThisBuffer instead.
"
command! -bang WatchForChanges                  :call WatchForChanges(@%,  {'toggle': 1, 'autoread': <bang>0})
command! -bang WatchForChangesWhileInThisBuffer :call WatchForChanges(@%,  {'toggle': 1, 'autoread': <bang>0, 'while_in_this_buffer_only': 1})
command! -bang WatchForChangesAllFile           :call WatchForChanges('*', {'toggle': 1, 'autoread': <bang>0})

" WatchForChanges function
"
" This is used by the WatchForChanges* commands, but it can also be
" useful to call this from scripts. For example, if your script executes a
" long-running process, you can have your script run that long-running process
" in the background so that you can continue editing other files, redirects its
" output to a file, and open the file in another buffer that keeps reloading itself
" as more output from the long-running command becomes available.
"
" Arguments:
" * bufname: The name of the buffer/file to watch for changes.
"     Use '*' to watch all files.
" * options (optional): A Dict object with any of the following keys:
"   * autoread: If set to 1, causes autoread option to be turned on for the buffer in
"     addition to setting up the autocommands.
"   * toggle: If set to 1, causes this behavior to toggle between on and off.
"     Mostly useful for mappings and commands. In scripts, you probably want to
"     explicitly enable or disable it.
"   * disable: If set to 1, turns off this behavior (removes the autocommand group).
"   * while_in_this_buffer_only: If set to 0 (default), the events will be triggered no matter which
"     buffer you are editing. (Only the specified buffer will be checked for changes,
"     though, still.) If set to 1, the events will only be triggered while
"     editing the specified buffer.
"   * more_events: If set to 1 (the default), creates autocommands for the events
"     listed above. Set to 0 to not create autocommands for CursorMoved, CursorMovedI,
"     (Presumably, having too much going on for those events could slow things down,
"     since they are triggered so frequently...)
function! WatchForChanges(bufname, ...)
  " Figure out which options are in effect
  if a:bufname == '*'
    let id = 'WatchForChanges'.'AnyBuffer'
    " If you try to do checktime *, you'll get E93: More than one match for * is given
    let bufspec = ''
  else
    if bufnr(a:bufname) == -1
      echoerr "Buffer " . a:bufname . " doesn't exist"
      return
    end
    let id = 'WatchForChanges'.bufnr(a:bufname)
    let bufspec = a:bufname
  end

  if len(a:000) == 0
    let options = {}
  else
    if type(a:1) == type({})
      let options = a:1
    else
      echoerr "Argument must be a Dict"
    end
  end
  let autoread    = has_key(options, 'autoread')    ? options['autoread']    : 0
  let toggle      = has_key(options, 'toggle')      ? options['toggle']      : 0
  let disable     = has_key(options, 'disable')     ? options['disable']     : 0
  let more_events = has_key(options, 'more_events') ? options['more_events'] : 1
  let while_in_this_buffer_only = has_key(options, 'while_in_this_buffer_only') ? options['while_in_this_buffer_only'] : 0

  if while_in_this_buffer_only
    let event_bufspec = a:bufname
  else
    let event_bufspec = '*'
  end

  let reg_saved = @"
  "let autoread_saved = &autoread
  let msg = "\n"

  " Check to see if the autocommand already exists
  redir @"
    silent! exec 'au '.id
  redir END
  let l:defined = (@" !~ 'E216: No such group or event:')

  " If not yet defined...
  if !l:defined
    if l:autoread
      let msg = msg . 'Autoread enabled - '
      if a:bufname == '*'
        set autoread
      else
        setlocal autoread
      end
    end
    silent! exec 'augroup '.id
      if a:bufname != '*'
        "exec "au BufDelete    ".a:bufname . " :silent! au! ".id . " | silent! augroup! ".id
        "exec "au BufDelete    ".a:bufname . " :echomsg 'Removing autocommands for ".id."' | au! ".id . " | augroup! ".id
        exec "au BufDelete    ".a:bufname . " execute 'au! ".id."' | execute 'augroup! ".id."'"
      end
        exec "au BufEnter     ".event_bufspec . " :checktime ".bufspec
        exec "au CursorHold   ".event_bufspec . " :checktime ".bufspec
        exec "au CursorHoldI  ".event_bufspec . " :checktime ".bufspec

      " The following events might slow things down so we provide a way to disable them...
      " vim docs warn:
      "   Careful: Don't do anything that the user does
      "   not expect or that is slow.
      if more_events
        exec "au CursorMoved  ".event_bufspec . " :checktime ".bufspec
        exec "au CursorMovedI ".event_bufspec . " :checktime ".bufspec
      end
    augroup END
    let msg = msg . 'Now watching ' . bufspec . ' for external updates...'
  end

  " If they want to disable it, or it is defined and they want to toggle it,
  if l:disable || (l:toggle && l:defined)
    if l:autoread
      let msg = msg . 'Autoread disabled - '
      if a:bufname == '*'
        set noautoread
      else
        setlocal noautoread
      end
    end
    " Using an autogroup allows us to remove it easily with the following
    " command. If we do not use an autogroup, we cannot remove this
    " single :checktime command
    " augroup! checkforupdates
    silent! exec 'au! '.id
    silent! exec 'augroup! '.id
    let msg = msg . 'No longer watching ' . bufspec . ' for external updates.'
  elseif l:defined
    let msg = msg . 'Already watching ' . bufspec . ' for external updates'
  end

  echo msg
  let @"=reg_saved
endfunction

silent! execute WatchForChanges("*", {'autoread':1, 'more_events':1})
