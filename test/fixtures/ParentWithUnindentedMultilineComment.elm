module ParentWithUnindentedMultilineComment exposing (..)

{-| This is a comment in between two import statements.
sometimes I write things here because I like to watch the world burn
-}
import Test.ChildA


import Test.ChildB exposing (..)
{- this comment will end before an import
-}
import Html


main =
    Html.text "Hello, World!"
