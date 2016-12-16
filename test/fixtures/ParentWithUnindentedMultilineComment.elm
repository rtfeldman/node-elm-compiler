module ParentWithUnindentedMultilineComment exposing (..)

import Test.ChildA


{-| This is a comment in between two import statements.
sometimes I write things here because I like to watch the world burn
-}

import Test.ChildB exposing (..) {-| this comment will end before an import
-}
import Native.Child exposing (..)
import Html


main =
    Html.text "Hello, World!"
