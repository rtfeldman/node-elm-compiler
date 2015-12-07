module Parent (..) where

import ChildA


-- This is a comment in between two import statements.

import ChildB exposing (..)
import Native.Child exposing (..)
import Graphics.Element exposing (show)


main =
    show "Hello, World!"
