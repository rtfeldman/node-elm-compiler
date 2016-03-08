module Components.WidgetB.View (..) where

import Components.WidgetB.Model exposing (..)
import Components.WidgetB.Update exposing (..)
import Signal exposing (Address)
import Html exposing (Html, div, button, text)
import Html.Events exposing (onClick)


view : Address Action -> Model -> Html
view address model =
  div
    []
    [ button [ onClick address Decrement ] [ text "-" ]
    , div [] [ text (toString model) ]
    , button [ onClick address Increment ] [ text "+" ]
    ]
