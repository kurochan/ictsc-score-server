# frozen_string_literal: true

module Mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    # Add your custom classes if you have them:
    # This is used for generating payload types
    object_class Types::BaseObject
    # This is used for return fields on the mutation's payload
    field_class Types::BaseField
    # This is used for generating the `input: { ... }` object type
    input_object_class Types::BaseInputObject

    # あまりにも多用するのでショートハンド化
    def current_team!
      self.context.current_team!
    end

    def graphql_name
      self.class.graphql_name
    end

    def add_error_message(message, ast_node: nil, options: nil, extensions: nil)
      Rails.logger.error message
      self.context.add_error(GraphQL::ExecutionError.new(message, ast_node: ast_node, options: options, extensions: extensions))
    end

    def add_errors(*records)
      records.each do |record|
        record.errors.each do |error|
          message = "#{record.model_name} #{error.attribute} #{error.message}"
          self.add_error_message(GraphQL::ExecutionError.new(message))
        end
      end

      # resolveの戻り値はハッシュかnilな必要がある
      nil
    end

    class << self
      # フィールド一覧をクエリとして使える形式で返す
      def to_fields_query(with: nil)
        self.fields.map {|name, field|
          if field.type.kind.composite?
            "#{name} { #{field.type.to_fields_query(with: with&.at(name))} }"
          else
            name
          end
        }
          .join("\n")
      end
    end
  end
end
