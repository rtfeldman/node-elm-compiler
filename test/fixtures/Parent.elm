module Parent exposing (..)

import Test.ChildA


-- This is a comment in between two import statements.

import Test.ChildB exposing (..)
import Native.Child exposing (..)
import Html


main =
    Html.text "Hello, World!"
