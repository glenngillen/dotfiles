locals {
  a =<<END
    line 1
    line 2
    ${var.g}
    line 3
  END
}