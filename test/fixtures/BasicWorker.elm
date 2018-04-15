port module BasicWorker exposing (..)

import Platform


main : Program () String msg
main =
    Platform.worker
        { init = \_ -> ( "", reportFromWorker "it's alive!" )
        , update = \_ _ -> ( "", Cmd.none )
        , subscriptions = \_ -> Sub.none
        }


port reportFromWorker : String -> Cmd a
