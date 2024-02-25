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
. "$HOME/.cargo/env"
