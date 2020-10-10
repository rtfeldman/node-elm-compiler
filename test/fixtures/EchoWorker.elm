port module EchoWorker exposing (..)

import Platform


main : Program String String msg
main =
    Platform.worker
        { init = \msg -> ( "", reportFromWorker ("You said: " ++ msg) )
        , update = \_ _ -> ( "", Cmd.none )
        , subscriptions = \_ -> Sub.none
        }


port reportFromWorker : String -> Cmd a
