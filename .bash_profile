source ~/.bash/aliases
source ~/.bash/completions
source ~/.bash/paths
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

if [ -s /Users/db2/sqllib/db2profile ]; then 
    . /Users/db2/sqllib/db2profile
fi
