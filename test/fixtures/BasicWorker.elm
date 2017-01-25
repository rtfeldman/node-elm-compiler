port module BasicWorker exposing (..)

import Html
import Platform


main : Program Never String msg
main =
    Platform.program
        { init = ( "", report "it's alive!" )
        , update = \_ _ -> ( "", Cmd.none )
        , subscriptions = (\_ -> Sub.none)
        }


port report : String -> Cmd a
