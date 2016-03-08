module Components.WidgetA.Update where

import Effects exposing (Effects)
import Components.WidgetA.Model exposing (..)

type Action = Increment | Decrement | NoOp

update : Action -> Model -> (Model, Effects Action)
update action model =
  case action of
    Increment -> (model + 1, Effects.none)
    Decrement -> (model - 1, Effects.none)
    NoOp -> (model, Effects.none)
