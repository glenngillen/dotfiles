# Path to your oh-my-zsh configuration.
ZSH=$HOME/.oh-my-zsh

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
ZSH_THEME="blinks"

# Set to this to use case-sensitive completion
# CASE_SENSITIVE="true"

# Comment this out to disable weekly auto-update checks
DISABLE_AUTO_UPDATE="true"

# Uncomment following line if you want to disable colors in ls
# DISABLE_LS_COLORS="true"

# Uncomment following line if you want to disable autosetting terminal title.
DISABLE_AUTO_TITLE="true"

# Uncomment following line if you want red dots to be displayed while waiting for completion
COMPLETION_WAITING_DOTS="true"

plugins=(git ruby brew tmux tmuxinator)

source ~/.zsh/paths
source ~/.zsh/aliases
source ~/.zsh/completions
source ~/.zsh/commands
source ~/.zsh/config
source ~/.oh-my-zsh/oh-my-zsh.sh

# Path completions
typeset -gU cdpath
setopt autocd

# Clear right prompt
RPROMPT=""
title() {
  print -Pn "\e]1;$1:q\a"
}

#indicate_tmux_session_in_terminal() {
#  title "$(tmux display-message -p '#S')"
#}
#
#precmd_functions=($precmd_functions indicate_tmux_session_in_terminal)

# tabtab source for serverless package
# uninstall by removing these lines or running `tabtab uninstall serverless`
[[ -f /usr/local/lib/node_modules/serverless/node_modules/tabtab/.completions/serverless.zsh ]] && . /usr/local/lib/node_modules/serverless/node_modules/tabtab/.completions/serverless.zsh
# tabtab source for sls package
# uninstall by removing these lines or running `tabtab uninstall sls`
[[ -f /usr/local/lib/node_modules/serverless/node_modules/tabtab/.completions/sls.zsh ]] && . /usr/local/lib/node_modules/serverless/node_modules/tabtab/.completions/sls.zsh


export OCKAM_DISABLE_UPGRADE_CHECK=1

gpgconf --launch gpg-agent
export PATH="/opt/homebrew/opt/rustup/bin:$PATH"
# export PATH="/opt/homebrew/anaconda3/bin:$PATH"  # commented out by conda initialize

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/homebrew/anaconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/opt/homebrew/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/opt/homebrew/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="/opt/homebrew/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

eval "$(starship init zsh)"
# bun completions
[ -s "/Users/glenn/.bun/_bun" ] && source "/Users/glenn/.bun/_bun"

function aws() {
  if [[ $1 == "login" ]]; then
    shift # Remove the 'login' argument
    command aws sso login --sso-session infracost "$@"
  else
    command aws "$@"
  fi
}

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

source /Users/glenn/.docker/init-zsh.sh || true # Added by Docker Desktop
