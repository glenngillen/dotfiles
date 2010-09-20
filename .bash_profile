source ~/.bash/aliases
source ~/.bash/completions
source ~/.bash/paths
source ~/.bash/commands
source ~/.bash/config

if [ -f ~/.bashrc ]; then
  . ~/.bashrc
fi
 
if [ -f ~/.localrc ]; then
  . ~/.localrc
fi

if [ -s ~/.rvm/scripts/rvm ] ; then 
  . ~/.rvm/scripts/rvm
fi