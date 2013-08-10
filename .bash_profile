source ~/.shell/aliases
source ~/.shell/completions
source ~/.shell/commands
source ~/.shell/paths
source ~/.shell/config

if [ -f ~/.bashrc ]; then
  . ~/.bashrc
fi

if [ -f ~/.localrc ]; then
  . ~/.localrc
fi

if [ -s ~/.rvm/scripts/rvm ] ; then
  . ~/.rvm/scripts/rvm
fi

if [ -s /Users/db2/sqllib/db2profile ]; then
    . /Users/db2/sqllib/db2profile
fi
