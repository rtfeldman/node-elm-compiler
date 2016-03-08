module Components.WidgetB.Main (..) where

import StartApp
import Effects exposing (Effects)
import Signal exposing (Signal)
import Html exposing (Html)
import Components.WidgetB.Model exposing (Model, initialModel)
import Components.WidgetB.View exposing (view)
import Components.WidgetB.Update as Update exposing (update)


main : Signal Html
main =
  app.html


app : StartApp.App Model
app =
  StartApp.start
    { init = ( initialModel, Effects.none )
    , view = view
    , update = update
    , inputs = [ messages.signal ]
    }


messages : Signal.Mailbox Update.Action
messages =
  Signal.mailbox Update.NoOp
