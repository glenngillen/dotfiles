source ~/.shell/aliases
source ~/.shell/completions
source ~/.shell/commands
source ~/.shell/paths
source ~/.shell/config
#
#if [ -f ~/.bashrc ]; then
#  . ~/.bashrc
#fi
#
#if [ -f ~/.localrc ]; then
#  . ~/.localrc
#fi

# added by Miniconda3 installer
export PATH="/Users/glenngillen/miniconda3/bin:$PATH"

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
. "$HOME/.ockam/env"

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/homebrew/anaconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
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


source /Users/glenn/.docker/init-bash.sh || true # Added by Docker Desktop
