port module BasicWorker exposing (..)

import Html.App
import Html


main : Program Never
main =
    Html.App.program
        { init = ( "", report "it's alive!" )
        , view = \_ -> Html.text ""
        , update = \_ _ -> ( "", Cmd.none )
        , subscriptions = (\_ -> Sub.none)
        }


port report : String -> Cmd a
