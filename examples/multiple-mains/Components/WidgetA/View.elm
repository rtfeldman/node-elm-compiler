module Components.WidgetA.View (..) where

import Components.WidgetA.Model exposing (..)
import Components.WidgetA.Update exposing (..)
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
