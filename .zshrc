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
# COMPLETION_WAITING_DOTS="true"

plugins=(git osx ruby cloudapp bundler brew)

source ~/.oh-my-zsh/oh-my-zsh.sh
source ~/.zsh/aliases
source ~/.zsh/completions
source ~/.zsh/commands
source ~/.zsh/paths
source ~/.zsh/config

# Customize to your needs...
if [ -s ~/.rvm/scripts/rvm ] ; then
  . ~/.rvm/scripts/rvm
fi
eval "$(ion-client shell)"

### Added by the Heroku Toolbelt
export PATH="/usr/local/heroku/bin:$PATH"
